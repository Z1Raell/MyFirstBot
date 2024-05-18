const restify = require("restify");
const cron = require('node-cron');
const { ActionTypes, TurnContext, CardFactory, ActivityTypes } = require("botbuilder");

const {
  CloudAdapter,
  ConfigurationServiceClientCredentialFactory,
  ConfigurationBotFrameworkAuthentication,
  TeamsActivityHandler
} = require("botbuilder");
const { TeamsBot } = require("./teamsBot");
const config = require("./config");

const credentialsFactory = new ConfigurationServiceClientCredentialFactory({
  MicrosoftAppId: config.botId,
  MicrosoftAppPassword: config.botPassword,
  MicrosoftAppType: "MultiTenant",
});

const botFrameworkAuthentication = new ConfigurationBotFrameworkAuthentication({}, credentialsFactory);
const adapter = new CloudAdapter(botFrameworkAuthentication);

adapter.onTurnError = async (context, error) => {
  console.error(`\n [onTurnError] unhandled error: ${error}`);
  if (context.activity.type === "message") {
    await context.sendActivity(`The bot encountered an unhandled error:\n ${error.message}`);
    await context.sendActivity("To continue to run this bot, please fix the bot source code.");
  }
};

const bot = new TeamsBot();

const server = restify.createServer();
server.use(restify.plugins.bodyParser());
server.listen(process.env.port || process.env.PORT || 3978, function () {
  console.log(`\nBot started, ${server.name} listening to ${server.url}`);
});

server.post("/api/messages", async (req, res) => {
  await adapter.process(req, res, async (context) => {
    await bot.run(context);
  });
});

cron.schedule("*/1 * * * *", async () => {
  const eventActivity = {
    callerId: { id: 'some-id' },
    type: ActivityTypes.Event,
    name: "ScheduledMessage",
    value: { text: "Ваше сообщение здесь" }
  };
  console.log(eventActivity); // Log the eventActivity object for debugging
  
  await adapter.processActivityDirect('', eventActivity, async (context) => {
    await bot.run(context);
  });
});

server.post("/api/scheduler", async (req, res) => {
  const eventActivity = {
    callerId: { id: 'some-id' },
    type: 'event',
    name: "ScheduledMessage",
    value: { text: "Ваше сообщение здесь" }
  };
  
  console.log(eventActivity); // Log the eventActivity object for debugging
  
  await adapter.processActivityDirect('', eventActivity, async (context) => {
    await bot.run(context);
  });
  res.send(200);
});

["exit", "uncaughtException", "SIGINT", "SIGTERM", "SIGUSR1", "SIGUSR2"].forEach((event) => {
  process.on(event, () => {
    server.close();
  });
});