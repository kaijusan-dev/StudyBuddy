from datetime import datetime
from telegram import Update
from telegram.ext import ContextTypes
from config import ADMIN_IDS
from db import get_connection

async def is_admin(update: Update) -> bool:
    return update.effective_user.id in ADMIN_IDS

async def admin_panel(update: Update, context: ContextTypes.DEFAULT_TYPE):
    if not await is_admin(update):
        await update.message.reply_text("⛔ Нет прав.")
        return
    await update.message.reply_text(
        "🛠 **Админ-панель**\n\n"
        "/stats – статистика пользователей\n"
        "/listusers – список ID пользователей\n"
        "/broadcast <текст> – рассылка\n"
        "/resetpet <id> – удалить питомца и расписание\n"
        "/setxp <id> <xp> – изменить опыт\n"
        "/setlevel <id> <level> – изменить уровень\n"
        "/setstats <id> <fullness> <happiness> <energy> – изменить параметры\n"
        "/setfullness <id> <value> – установить сытость (0-30)\n"
        "/sethappiness <id> <value> – установить счастье (0-100)\n"
        "/setenergy <id> <value> – установить энергию (0-100)\n"
        "/addcoins <id> <amount> – начислить монеты\n"
        "/setcoins <id> <amount> – установить количество монет",
        parse_mode="Markdown"
    )

async def stats(update: Update, context: ContextTypes.DEFAULT_TYPE):
    if not await is_admin(update):
        return
    with get_connection() as conn:
        count = conn.execute("SELECT COUNT(*) FROM pets").fetchone()[0]
    await update.message.reply_text(f"📊 Всего пользователей: {count}")

async def listusers(update: Update, context: ContextTypes.DEFAULT_TYPE):
    if not await is_admin(update):
        return
    with get_connection() as conn:
        rows = conn.execute("SELECT telegram_id FROM pets").fetchall()
    if not rows:
        await update.message.reply_text("Нет пользователей.")
        return
    ids = [str(row["telegram_id"]) for row in rows]
    await update.message.reply_text("👥 Список ID:\n" + "\n".join(ids[:50]))

async def broadcast(update: Update, context: ContextTypes.DEFAULT_TYPE):
    if not await is_admin(update):
        return
    args = context.args
    if not args:
        await update.message.reply_text("❓ /broadcast <текст>")
        return
    text = " ".join(args)
    with get_connection() as conn:
        rows = conn.execute("SELECT telegram_id FROM pets").fetchall()
    sent = 0
    for row in rows:
        try:
            await context.bot.send_message(int(row["telegram_id"]), f"📢 **Анонс**\n{text}", parse_mode="Markdown")
            sent += 1
        except:
            pass
    await update.message.reply_text(f"✅ Отправлено {sent} пользователям.")

async def resetpet(update: Update, context: ContextTypes.DEFAULT_TYPE):
    if not await is_admin(update):
        return
    args = context.args
    if len(args) != 1:
        await update.message.reply_text("❓ /resetpet <telegram_id>")
        return
    uid = int(args[0])
    with get_connection() as conn:
        conn.execute("DELETE FROM schedule WHERE telegram_id = ?", (uid,))
        conn.execute("DELETE FROM pets WHERE telegram_id = ?", (uid,))
        conn.commit()
    await update.message.reply_text(f"✅ Питомец и расписание пользователя {uid} удалены.")

async def setxp(update: Update, context: ContextTypes.DEFAULT_TYPE):
    if not await is_admin(update):
        return
    args = context.args
    if len(args) != 2:
        await update.message.reply_text("❓ /setxp <telegram_id> <xp>")
        return
    uid = int(args[0])
    try:
        xp = int(args[1])
    except:
        await update.message.reply_text("❌ XP должно быть числом.")
        return
    with get_connection() as conn:
        conn.execute("UPDATE pets SET xp = ? WHERE telegram_id = ?", (xp, uid))
        conn.commit()
    await update.message.reply_text(f"✅ XP пользователя {uid} установлено в {xp}.")

async def setlevel(update: Update, context: ContextTypes.DEFAULT_TYPE):
    if not await is_admin(update):
        return
    args = context.args
    if len(args) != 2:
        await update.message.reply_text("❓ /setlevel <telegram_id> <level>")
        return
    uid = int(args[0])
    try:
        level = int(args[1])
    except:
        await update.message.reply_text("❌ Уровень должен быть числом.")
        return
    with get_connection() as conn:
        conn.execute("UPDATE pets SET level = ? WHERE telegram_id = ?", (level, uid))
        conn.commit()
    await update.message.reply_text(f"✅ Уровень пользователя {uid} установлен в {level}.")

async def setstats(update: Update, context: ContextTypes.DEFAULT_TYPE):
    if not await is_admin(update):
        return
    args = context.args
    if len(args) != 4:
        await update.message.reply_text("❓ /setstats <telegram_id> <fullness> <happiness> <energy>")
        return
    uid = int(args[0])
    try:
        fullness = float(args[1])
        happiness = float(args[2])
        energy = float(args[3])
        if not (0 <= fullness <= 30 and 0 <= happiness <= 100 and 0 <= energy <= 100):
            raise ValueError
    except:
        await update.message.reply_text("❌ Значения должны быть числами: сытость 0-30, счастье 0-100, энергия 0-100.")
        return
    with get_connection() as conn:
        conn.execute(
            "UPDATE pets SET fullness = ?, happiness = ?, energy = ? WHERE telegram_id = ?",
            (fullness, happiness, energy, uid)
        )
        conn.commit()
    await update.message.reply_text(f"✅ Питомец {uid}: сытость={fullness}, счастье={happiness}, энергия={energy}.")

async def setfullness(update: Update, context: ContextTypes.DEFAULT_TYPE):
    if not await is_admin(update):
        return
    args = context.args
    if len(args) != 2:
        await update.message.reply_text("❓ /setfullness <telegram_id> <value>")
        return
    uid = int(args[0])
    try:
        val = float(args[1])
        if not (0 <= val <= 30):
            raise ValueError
    except:
        await update.message.reply_text("❌ Значение должно быть числом от 0 до 30.")
        return
    with get_connection() as conn:
        conn.execute("UPDATE pets SET fullness = ? WHERE telegram_id = ?", (val, uid))
        conn.commit()
    await update.message.reply_text(f"✅ Сытость питомца {uid} установлена в {val}.")

async def sethappiness(update: Update, context: ContextTypes.DEFAULT_TYPE):
    if not await is_admin(update):
        return
    args = context.args
    if len(args) != 2:
        await update.message.reply_text("❓ /sethappiness <telegram_id> <value>")
        return
    uid = int(args[0])
    try:
        val = float(args[1])
        if not (0 <= val <= 100):
            raise ValueError
    except:
        await update.message.reply_text("❌ Значение должно быть числом от 0 до 100.")
        return
    with get_connection() as conn:
        conn.execute("UPDATE pets SET happiness = ? WHERE telegram_id = ?", (val, uid))
        conn.commit()
    await update.message.reply_text(f"✅ Счастье питомца {uid} установлено в {val}.")

async def setenergy(update: Update, context: ContextTypes.DEFAULT_TYPE):
    if not await is_admin(update):
        return
    args = context.args
    if len(args) != 2:
        await update.message.reply_text("❓ /setenergy <telegram_id> <value>")
        return
    uid = int(args[0])
    try:
        val = float(args[1])
        if not (0 <= val <= 100):
            raise ValueError
    except:
        await update.message.reply_text("❌ Значение должно быть числом от 0 до 100.")
        return
    with get_connection() as conn:
        conn.execute("UPDATE pets SET energy = ? WHERE telegram_id = ?", (val, uid))
        conn.commit()
    await update.message.reply_text(f"✅ Энергия питомца {uid} установлена в {val}.")

async def addcoins(update: Update, context: ContextTypes.DEFAULT_TYPE):
    if not await is_admin(update):
        return
    args = context.args
    if len(args) != 2:
        await update.message.reply_text("❓ /addcoins <telegram_id> <количество>")
        return
    try:
        uid = int(args[0])
        amount = int(args[1])
    except ValueError:
        await update.message.reply_text("❌ ID и количество должны быть числами.")
        return
    with get_connection() as conn:
        conn.execute("UPDATE pets SET coins = coins + ? WHERE telegram_id = ?", (amount, uid))
        conn.commit()
        row = conn.execute("SELECT coins FROM pets WHERE telegram_id = ?", (uid,)).fetchone()
    if row is None:
        await update.message.reply_text("❌ Пользователь не найден.")
        return
    await update.message.reply_text(f"✅ Пользователю {uid} начислено {amount} монет. Теперь у него {row['coins']} монет.")

async def setcoins(update: Update, context: ContextTypes.DEFAULT_TYPE):
    if not await is_admin(update):
        return
    args = context.args
    if len(args) != 2:
        await update.message.reply_text("❓ /setcoins <telegram_id> <количество>")
        return
    try:
        uid = int(args[0])
        amount = int(args[1])
        if amount < 0:
            raise ValueError
    except ValueError:
        await update.message.reply_text("❌ ID и количество должны быть неотрицательными числами.")
        return
    with get_connection() as conn:
        conn.execute("UPDATE pets SET coins = ? WHERE telegram_id = ?", (amount, uid))
        conn.commit()
        row = conn.execute("SELECT coins FROM pets WHERE telegram_id = ?", (uid,)).fetchone()
    if row is None:
        await update.message.reply_text("❌ Пользователь не найден.")
        return
    await update.message.reply_text(f"✅ Пользователю {uid} установлено {amount} монет.")
