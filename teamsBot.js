const { TeamsActivityHandler, TurnContext, CardFactory, ActivityTypes } = require("botbuilder");
const { getUser } = require('./component/getUser');

class TeamsBot extends TeamsActivityHandler {
  constructor() {
    super();

    this.onMessage(async (context, next) => {
      console.log("Running with Message Activity.");
      const removedMentionText = TurnContext.removeRecipientMention(context.activity);
      const txt = removedMentionText?.toLowerCase().replace(/\n|\r/g, "").trim();

      if (txt === 'card') {
        const card = CardFactory.adaptiveCard({
          type: 'AdaptiveCard',
          body: [
            {
              type: 'TextBlock',
              text: 'Пример карточки с кнопкой'
            }
          ],
          actions: [
            {
              type: 'Action.Submit',
              title: 'Нажмите на меня',
              data: {
                buttonClicked: 'true',
                additionalData: 'Какие-то данные'
              }
            }
          ],
          $schema: 'http://adaptivecards.io/schemas/adaptive-card.json',
          version: '1.4'
        });
        await context.sendActivity({ attachments: [card] });
        return;
      }

      if (context.activity.text === 'stat') {
        const userDate = await getUser();
        console.log(userDate);
        await context.sendActivity('we get date');
        return;
      }

      if (context.activity.value && context.activity.value.buttonClicked === 'true') {
        await context.sendActivity(`Echo: ${context.activity.value.additionalData}`);
        return;
      }

      await context.sendActivity(`Echo: ${context.activity.text}`);
      await next();
    });

    this.onEvent(async (context, next) => {
      if (context.activity.type === ActivityTypes.Event) {
        if (context.activity.name === 'ScheduledMessage') {
          await context.sendActivity('its work');
          return;
        }
        if (context.activity.callerId && context.activity.callerId.id) {
          // Do something with context.activity.callerId.id
        }
      }
      await next();
    });

    this.onMembersAdded(async (context, next) => {
      const membersAdded = context.activity.membersAdded;
      for (let cnt = 0; cnt < membersAdded.length; cnt++) {
        if (membersAdded[cnt].id) {
          await context.sendActivity(`Hi there! I'm a Teams bot that will echo what you said to me.`);
          break;
        }
      }
      await next();
    });
  }
}

module.exports.TeamsBot = TeamsBot;