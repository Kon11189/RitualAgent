const { Telegraf } = require('telegraf');
const { OpenRouter } = require('@openrouter/sdk');
const http = require('http');

// Простая заглушка для Render, каб бот лічыўся "жывым"
http.createServer((req, res) => {
  res.write('Бот Разам працуе!');
  res.end();
}).listen(process.env.PORT || 8080);

const TELEGRAM_TOKEN = '8604622252:AAEJXWrh0si6U4x6cffaaXabjU2rLAwUgQY';
const OPENROUTER_API_KEY = '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';

const bot = new Telegraf(TELEGRAM_TOKEN);
const openrouter = new OpenRouter({ apiKey: OPENROUTER_API_KEY });

const facts = [
  "Беларуская мова — адна са старажытных славянскіх моў.",
  "У беларускім алфавіце ёсць унікальная літара — Ў (у нескладовае).",
  "Першая друкаваная кніга на ўсходнеславянскай мове была беларускай.",
  "Беларуская мова прызнана ЮНЕСКА самай мілагучнай пасля італьянскай.",
  "У нашай мове няма літары 'щ', замест яе — спалучэнне 'шч'.",
  "Статут ВКЛ быў напісаны на старабеларускай мове.",
  "Беларуская лацінка — гэта адмысловы алфавіт на аснове лацінскіх літар.",
  "Слова 'каханне' ўжываецца толькі да людзей, да рэчаў — 'любоў'.",
  "У 1920-х гадах у Беларусі было ажно 4 дзяржаўныя мовы.",
  "Літара 'г' у нас вымаўляецца мякка і прыдыхальна.",
  "Беларуская мова ўваходзіць у ТОП-50 самых распаўсюджаных моў свету.",
  "Самае старажытнае беларускае слова, зафіксаванае пісьмова — 'жыці'.",
  "Беларускі правапіс называецца 'наркамаўка' або 'тарашкевіца'.",
  "У нашай мове ёсць шыпячыя гукі, якія робяць яе вельмі выразнай.",
  "Беларуская мова — гэта генетычны код нашай нацыі."
];

bot.on('text', async (ctx) => {
  const randomFact = facts[Math.floor(Math.random() * facts.length)];
  const waitingMessage = await ctx.reply(`Пакуль я калдую, вось табе цікавы факт пра нашу родную мову: \n\n✨ ${randomFact}`);

  try {
    let responseText = "";
    const stream = await openrouter.chat.send({
      model: "deepseek/deepseek-v3.2",
      messages: [
        { 
          role: "system", 
          content: "Ты — інтэлектуальны памочнік 'Разам'. Адказвай СТРОГА на беларускай мове. Не выкарыстоўвай сімвалы *** або ///. Твой адказ павінен быць чыстым тэкстам." 
        },
        { role: "user", content: ctx.message.text }
      ],
      stream: true
    });

    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content;
      if (content) responseText += content;
    }

    await ctx.telegram.deleteMessage(ctx.chat.id, waitingMessage.message_id);
    await ctx.reply(responseText);

  } catch (error) {
    console.error(error);
    ctx.reply("Прабачце, адбылася памылка пры злучэнні з магіяй AI.");
  }
});

bot.launch();
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
