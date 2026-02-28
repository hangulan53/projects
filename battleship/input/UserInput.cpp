#include "UserInput.h"

void gameLoop(Game& game)
{
    char command = '~';
    while (command != 'q')
    {
        if (game.checkGameStatus(Game::GameStatus::MENU))
        {
            std::cout << "=== Main Menu ===\n";
            std::cout << "[n] New Game\n";
            std::cout << "[l] Load Game\n";
            std::cout << "[q] Quit\n";
        }
        else if (game.checkGameStatus(Game::GameStatus::GAME))
        {
            std::cout << "=== In Game ===\n";
            std::cout << "[a] Attack\n";
            std::cout << "[u] Use Ability\n";
            std::cout << "[p] Pause\n";
        }
        else if (game.checkGameStatus(Game::GameStatus::PAUSE))
        {
            std::cout << "=== Pause ===\n";
            std::cout << "[c] Continue\n";
            std::cout << "[s] Save Game\n";
            std::cout << "[l] Load Game\n";
            std::cout << "[m] Main Menu\n";
        }

        std::cin >> command;

        switch (command)
        {
            case 'n':
            {
                std::cout << "New game started.\n\n";                       
                game.startGame();
                std::cout << "\nPlayer field:\n";
                game.getPlayerState().getGameField().printGameField(false);
                std::cout << "Enemy field:\n";
                game.getEnemyState().getGameField().printGameField(true);
                break;
            }

            case 'l':
            {
                std::string filename1 = "player_save";
                std::string filename2 = "enemy_save";

                /*std::string filename1, filename2;
                std::cout << "Enter name to load the players data: ";
                std::cin >> filename1;
                std::cout << "Enter name to load the enemys data: ";
                std::cin >> filename2;
                std::cout << '\n';*/

                GameSerializer::loadGame(game, filename1, filename2);
                std::cout << "Game loaded from '" << filename1 << "' and '" << filename2 << "'.\n";
                std::cout << "\nPlayer field:\n";
                game.getPlayerState().getGameField().printGameField(false);
                std::cout << "Enemy field:\n";
                game.getEnemyState().getGameField().printGameField(true);
                break;
            }

            case 'q':
            {
                std::cout << "\nThanks for playing!\n";
                break;
            }



            case 'a':
            {
                int x, y;
                std::cout << "Enter the coordinates for attack ('x y'): ";
                std::cin >> x >> y;
                game.lap(x, y);

                if (game.checkGameStatus(Game::GameStatus::GAME))
                {
                    std::cout << "\nPlayer field after attack:\n";
                    game.getPlayerState().getGameField().printGameField(false);
                    std::cout << "Enemy field after attack:\n";
                    game.getEnemyState().getGameField().printGameField(true);
                }
                else if (game.checkGameStatus(Game::GameStatus::WIN))
                {
                    std::cout << "You have won the round! Starting next...\n";
                    std::cout << "\nPlayer field:\n";
                    game.getPlayerState().getGameField().printGameField(false);
                    std::cout << "Enemy field:\n";
                    game.getEnemyState().getGameField().printGameField(true);
                }
                else if (game.checkGameStatus(Game::GameStatus::LOSE))
                {
                    std::cout << "Game over! You have survived " << game.getPlayerState().getWinsCount() << " rounds.\n";
                    std::cout << "\nPlayer field:\n";
                    game.getPlayerState().getGameField().printGameField(false);
                    std::cout << "Enemy field:\n";
                    game.getEnemyState().getGameField().printGameField(true);
                    std::cout << "Returning to menu...\n\n";
                    game.setGameStatus(Game::GameStatus::MENU);
                }

                break;
            }

            case 'u':
            {
                game.activateAbility();
                std::cout << "\nPlayer field:\n";
                game.getPlayerState().getGameField().printGameField(false);
                std::cout << "Enemy field after using ability:\n";
                game.getEnemyState().getGameField().printGameField(true);
                break;
            }

            case 'p':
            {
                game.setGameStatus(Game::GameStatus::PAUSE);
                std::cout << "Game was paused.\n\n";
                break;
            }



            case 'c':
            {   
                game.setGameStatus(Game::GameStatus::GAME);
                std::cout << "Game was continued.\n\n";
                break;
            }            

            case 's':
            {
                std::string filename1 = "player_save";
                std::string filename2 = "enemy_save";

                /*std::string filename1, filename2;
                std::cout << "Enter name for save the players data: ";
                std::cin >> filename1;
                std::cout << "Enter name for save the enemys data: ";
                std::cin >> filename2;
                std::cout << '\n';*/

                GameSerializer::saveGame(game, filename1, filename2);
                std::cout << "Game saved to '" << filename1 << "' and '" << filename2 << "'.\n";

                break;
            }

            case 'm':
            {
                game.setGameStatus(Game::GameStatus::MENU);
                std::cout << "Returned to menu.\n\n";
                break;
            }           

            default:
            {
                std::cout << "Unknown command.\n\n";
            }
        }
    }
}