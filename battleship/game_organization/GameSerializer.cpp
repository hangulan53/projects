#include "GameSerializer.h"

void GameSerializer::saveGame(Game& game, std::string filename1, std::string filename2)
{
    std::ofstream file1(filename1);
    if (file1.is_open())
    {
        file1 << game.getPlayerState();
        file1.close();
    }

    std::ofstream file2(filename2);
    if (file2.is_open())
    {
        file2 << game.getEnemyState();
        file2.close();
    }

}

void GameSerializer::loadGame(Game& game, std::string filename1, std::string filename2)
{
    std::ifstream file1(filename1);

    if (file1.is_open())
    {
        file1 >> game.getPlayerState();
        file1.close();
    }

    std::ifstream file2(filename2);

    if (file2.is_open())
    {
        file2 >> game.getEnemyState();
        file2.close();
    }

}