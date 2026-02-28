#ifndef GAME_H
#define GAME_H

#include "../states/PlayerState.h"
#include "../states/EnemyState.h"
#include "../placers/ShipPlacer.h"
#include "../holders/CoordHolder.h"
#include "../consts.h"

class Game
{
public:
    enum GameStatus
    {
        MENU,
        SHIP_PLACEMENT,
        GAME,
        WIN,
        LOSE,
        PAUSE,
        EXIT 
    };

private:
    EnemyState enemyState;
    PlayerState playerState;
    GameStatus gameStatus = GameStatus::MENU;
    
public:
    Game(int width=WIDTH, int height=HEIGHT, int ships_count=SHIPS_COUNT, std::initializer_list<int> ships_sizes={S1, S2, S3, S4, S5, S6, S7, S8, S9, S10});

    PlayerState& getPlayerState();
    EnemyState& getEnemyState();
    bool checkGameStatus(GameStatus status);
    void setGameStatus(GameStatus status);
    void startGame();
    void lap(int x, int y);
    void startNextRound();
    void attack(int x, int y, bool side);
    void activateAbility();
    
};

#endif