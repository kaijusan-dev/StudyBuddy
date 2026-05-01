import random

active_games = {}

async def rps_start(update, context):
    user_id = update.effective_user.id
    active_games[user_id] = {'game': 'rps', 'player_score': 0, 'bot_score': 0}
    
    from keyboards import get_rps_keyboard
    reply_markup = get_rps_keyboard()
    
    await update.message.reply_text(
        "🗿✂️📄 Камень, ножницы, бумага — до 3 побед!\n\nСчёт: 0 : 0\nТвой ход:",
        reply_markup=reply_markup
    )

async def rps_callback(update, context):
    query = update.callback_query
    await query.answer()
    
    user_id = update.effective_user.id
    data = query.data
    
    if user_id not in active_games or active_games[user_id].get('game') != 'rps':
        await query.edit_message_text("❌ У тебя нет активной игры. Начни новую командой /rps")
        return
    
    game = active_games[user_id]
    
    if data == "rps_exit":
        del active_games[user_id]
        await query.edit_message_text("Игра завершена. Возвращайся ещё! /rps")
        return
    
    player_choice = data.split('_')[1]
    choices = ['rock', 'scissors', 'paper']
    bot_choice = random.choice(choices)
    
    emoji = {'rock': '🗿', 'scissors': '✂️', 'paper': '📄'}
    
    if player_choice == bot_choice:
        round_result = "🤝 Ничья"
        happiness_add = 0
    elif ((player_choice == 'rock' and bot_choice == 'scissors') or
          (player_choice == 'scissors' and bot_choice == 'paper') or
          (player_choice == 'paper' and bot_choice == 'rock')):
        round_result = "🎉 Ты выиграл раунд!"
        game['player_score'] += 1
        happiness_add = 5
    else:
        round_result = "🤖 Бот выиграл раунд!"
        game['bot_score'] += 1
        happiness_add = 0
    
    # Начисляем счастье за победу в раунде
    if happiness_add > 0:
        from pet import add_happiness
        new_happiness = await add_happiness(user_id, happiness_add)
    
    player_score, bot_score = game['player_score'], game['bot_score']
    
    # Проверка на победу в серии
    if player_score >= 3 or bot_score >= 3:
        if player_score >= 3:
            winner = "🏆 Ты выиграл всю серию!"
            from pet import add_happiness
            await add_happiness(user_id, 10)  # Бонус за победу в серии
        else:
            winner = "💻 Бот выиграл серию."
        
        del active_games[user_id]
        await query.edit_message_text(f"{winner}\n\nФинальный счёт: {player_score} : {bot_score}\nСыграть ещё? /rps")
        return
    
    from keyboards import get_rps_keyboard
    reply_markup = get_rps_keyboard()
    
    new_text = (f"🗿✂️📄 Камень, ножницы, бумага — до 3 побед!\n\n"
                f"Твой выбор: {emoji[player_choice]}\nВыбор бота: {emoji[bot_choice]}\n{round_result}\n\n"
                f"Счёт: {player_score} : {bot_score}\n\nТвой следующий ход:")
    
    await query.edit_message_text(text=new_text, reply_markup=reply_markup)