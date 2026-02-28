#ifndef GAME_SERIALIZER_H
#define GAME_SERIALIZER_H

#include "Game.h"
#include "../states/PlayerState.h"
#include "../states/EnemyState.h"

class GameSerializer
{
public:
    static void saveGame(Game& game, std::string filename1, std::string filename2);
    static void loadGame(Game& game, std::string filename1, std::string filename2);
};

#endif