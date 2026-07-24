const TELEGRAM_API = `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}`;

const GREETING =
  "Салам! 💛\n\n" +
  "Бул жерге Акылтай менен Толкундун тоюндагы сүрөттөрүңүздү жана видеолоруңузду жөнөтө аласыз.\n\n" +
  "Сүрөт же видео жөнөтүңүз — биз аны жаш жубайларга жеткиребиз!";

const THANKS = "Рахмат! Сүрөтүңүз/видеоңуз жөнөтүлдү 💛";
const ASK_FOR_MEDIA = "Сураныч, сүрөт же видео жөнөтүңүз 📸🎥";

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 200, body: "OK" };
  }

  let update;
  try {
    update = JSON.parse(event.body);
  } catch (err) {
    return { statusCode: 400, body: "Bad request" };
  }

  const message = update.message;
  if (!message) {
    return { statusCode: 200, body: "OK" };
  }

  const chatId = message.chat.id;
  const text = (message.text || "").trim();

  if (text === "/start") {
    await sendMessage(chatId, GREETING);
    return { statusCode: 200, body: "OK" };
  }

  if (text === "/id") {
    await sendMessage(chatId, `Сиздин chat ID: ${chatId}`);
    return { statusCode: 200, body: "OK" };
  }

  const hasMedia = Boolean(
    message.photo || message.video || message.video_note || message.document
  );

  if (hasMedia) {
    const groomChatId = process.env.GROOM_CHAT_ID;
    if (groomChatId) {
      await forwardMessage(groomChatId, chatId, message.message_id);
    }
    await sendMessage(chatId, THANKS);
  } else {
    await sendMessage(chatId, ASK_FOR_MEDIA);
  }

  return { statusCode: 200, body: "OK" };
};

async function sendMessage(chatId, text) {
  await fetch(`${TELEGRAM_API}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: chatId, text }),
  });
}

async function forwardMessage(toChatId, fromChatId, messageId) {
  await fetch(`${TELEGRAM_API}/forwardMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: toChatId,
      from_chat_id: fromChatId,
      message_id: messageId,
    }),
  });
}
