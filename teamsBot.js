const { TeamsActivityHandler, TurnContext, CardFactory, ActivityTypes } = require("botbuilder");
const { getUser } = require('./component/getUser');
const { getDate } = require('./component/getDate'); // Импортируем getAiResponse

class TeamsBot extends TeamsActivityHandler {
  constructor() {
    super();

    this.onMessage(async (context, next) => {
      console.log("Running with Message Activity.");
      const removedMentionText = TurnContext.removeRecipientMention(context.activity);
      const txt = removedMentionText ? removedMentionText.toLowerCase().replace(/\n|\r/g, "").trim() : '';


      if(txt === 'test') {
        let req = {login:'user1',...context.activity}
        let res =  getDate(req)
        
        console.log(res);
      } 
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
              title: 'Данные о страховке',
              data: {
                action: '1',
                additionalData: 'Какие-то данные'
              }
            },
            {
              type: 'Action.Submit',
              title: 'Страхование родственников',
              data: {
                action: '2',
                additionalData: 'Какие-то данные'
              }
            },
            {
              type: 'Action.Submit',
              title: 'Оформить страхование',
              data: {
                action: '3',
                additionalData: 'Какие-то данные'
              }
            },
            {
              type: 'Action.Submit',
              title: 'Отказаться от страховки',
              data: {
                action: '4',
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

      if (txt.startsWith('ai ')) {
        const query = txt.substring(3).trim(); // Получаем строку после 'ai '
        const aiResponse = await getAiResponse(query);

        const card = CardFactory.adaptiveCard({
          type: 'AdaptiveCard',
          body: [
            {
              type: 'TextBlock',
              text: `AI Response: ${aiResponse}`
            }
          ],
          actions: [
            {
              type: 'Action.Submit',
              title: 'Да',
              data: {
                action: 'confirm',
                response: aiResponse
              }
            },
            {
              type: 'Action.Submit',
              title: 'Нет',
              data: {
                action: 'reject',
                query: query
              }
            }
          ],
          $schema: 'http://adaptivecards.io/schemas/adaptive-card.json',
          version: '1.4'
        });

        await context.sendActivity({ attachments: [card] });
        return;
      }

      if (context.activity.value) {
        if (context.activity.value.action === 'confirm') {
          await context.sendActivity(`Вы подтвердили ответ: ${context.activity.value.response}`);
          return;
        }
        if (context.activity.value.action === 'reject') {
          await context.sendActivity('Пожалуйста, введите новую строку для запроса к AI:');
          // Сохраняем исходный запрос в контексте для использования в следующем сообщении
          context.turnState.set('originalQuery', context.activity.value.query);
          return;
        }
      }

      const originalQuery = context.turnState.get('originalQuery');
      if (originalQuery) {
        const newQuery = context.activity.text;
        const aiResponse = await getAiResponse(newQuery);

        const card = CardFactory.adaptiveCard({
          type: 'AdaptiveCard',
          body: [
            {
              type: 'TextBlock',
              text: `AI Response: ${aiResponse}`
            }
          ],
          actions: [
            {
              type: 'Action.Submit',
              title: 'Да',
              data: {
                action: 'confirm',
                response: aiResponse
              }
            },
            {
              type: 'Action.Submit',
              title: 'Нет',
              data: {
                action: 'reject',
                query: newQuery
              }
            }
          ],
          $schema: 'http://adaptivecards.io/schemas/adaptive-card.json',
          version: '1.4'
        });

        await context.sendActivity({ attachments: [card] });
        context.turnState.delete('originalQuery'); // Удаляем сохранённый запрос после использования
        return;
      }

      await context.sendActivity(`Echo: ${context.activity.text}`);
      await next();
    });

    this.onEvent(async (context, next) => {
      console.log(context.activity);
      if (context.activity.type === 'event') {
        console.log(context.activity.text);
        await context.sendActivity(context.activity.text);
        return;
      }
      if (context.activity.callerId && context.activity.callerId.id) {
        // Do something with context.activity.callerId.id
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
