#include "Game.h"

Game::Game(int width, int height, int ships_count, std::initializer_list<int> ships_sizes):
    enemyState(width, height, ships_count, ships_sizes),
    playerState(width, height, ships_count, ships_sizes, enemyState.getGameField())
{}

PlayerState& Game::getPlayerState()
{
    return playerState;
}

EnemyState& Game::getEnemyState()
{
    return enemyState;
}

bool Game::checkGameStatus(Game::GameStatus status)
{
    return gameStatus == status;
}

void Game::setGameStatus(Game::GameStatus status)
{
    gameStatus = status;
}

void Game::startGame()
{
    if (gameStatus == GameStatus::MENU){
        playerState.reset();
        enemyState.reset();

        gameStatus = GameStatus::SHIP_PLACEMENT;
        ShipPlacer::placePlayerShips(playerState.getGameField(), playerState.getShipManager());
        ShipPlacer::placeEnemyShips(enemyState.getGameField(), enemyState.getShipManager());
        
        gameStatus = GameStatus::GAME;
    }
}

void Game::lap(int x, int y)
{
    attack(x, y, true);
    if (enemyState.getShipManager().allShipsAreDestroyed()){
        gameStatus = GameStatus::WIN;
        startNextRound();
    }

    attack(0, 0, false);
    if (playerState.getShipManager().allShipsAreDestroyed()){
        gameStatus == GameStatus::LOSE;
    }
}

void Game::startNextRound()
{
    gameStatus = GameStatus::SHIP_PLACEMENT;
    enemyState.reset();
    ShipPlacer::placeEnemyShips(enemyState.getGameField(), enemyState.getShipManager());
    
    playerState.setWinsCount();
    gameStatus = GameStatus::WIN;
}

void Game::attack(int x, int y, bool side)
{
    try
    {
        if (gameStatus == GameStatus::GAME)
        {
            if (side == true)
            {
                if (enemyState.getGameField().attackCell(x, y, playerState.getLogHolder()))
                {
                    playerState.getAbilityManager().addAbility();
                }
            }
            else
            {
                playerState.getGameField().attackRandomCell();
            }
        }
    }
    catch(const std::exception& e)
    {
        std::cerr << e.what() << '\n';
    }
    
}

void Game::activateAbility()
{   
    try
    {
        if (gameStatus == GameStatus::GAME)
        {
            playerState.getAbilityManager().useAbility(playerState.getLogHolder());
            playerState.getLogHolder().printResult();
        }
    }
    catch(const std::exception& e)
    {
        std::cerr << e.what() << '\n';
    }
}