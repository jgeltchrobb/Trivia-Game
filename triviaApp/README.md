*users start game
can choose time limit?
every second over time limit you lose a point?

*allow users 10 seconds to vote on a topic
give them 10 questions to answer
show total time
show total score
show current progress through questions

*once finished
display winner and runner ups
give winner an overall score that perpetuates

*optional
allow users to create their own quizzes



>> new game
 - fires off a click to enter new game to each player
 - they must enter their handle at this stage
 - time limit to click yes
 - choose topic as optional extra feature
 - emit to server each players details
 ---- 
 - server stores players data (cookie included)
 - server starts game
 - disabled new game button
 ----
 - server gets new question and answer
 - server stores q & a in variables
 - server sends first question
 - if player guesses answer, player is awarded a point in their data
 - server emits to all sockets all players scores
 - repeat until x questions, x time for each question
 ----
 - players scores recorded on screen
 ----
 - server finishes game
 - reenable new game button
 ----
 on disconnect
 - store total score in players cookie + player id
