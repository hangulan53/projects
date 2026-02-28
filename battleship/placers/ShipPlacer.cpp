#include "ShipPlacer.h"

void ShipPlacer::placePlayerShips(GameField& gameField, ShipManager& shipManager)
{
    std::cout << "Placing player ships...\n";

    CoordHolder coordHolder;
    OrientationReader orientationReader;
    
    int placedShipsCount = 0;
    while (placedShipsCount != shipManager.getShipsCount())
    {
        try
        {
            /*coordHolder.setData();
            int x = coordHolder.getData().first;
            int y = coordHolder.getData().second;
            Ship::Orientation orientation = orientationReader.readOrientation();
            gameField.placeShip(placedShipsCount, x, y, orientation);
            std::cout << "Ship №" << placedShipsCount << " was successfully placed!\n";
            placedShipsCount += 1;*/

            int x = rand() % gameField.getWidth();
            int y = rand() % gameField.getHeight();
            Ship::Orientation orientation = rand() % 2 == 1 ? Ship::Orientation::HORIZONTAL : Ship::Orientation::VERTICAL;
            gameField.placeShip(placedShipsCount, x, y, orientation);
            placedShipsCount += 1;

        }
        catch(const std::exception& e)
        {
            std::cerr << e.what() << '\n';
        }
    }

    std::cout << "All player ships have been placed.\n"; 
}

void ShipPlacer::placeEnemyShips(GameField& gameField, ShipManager& shipManager)
{
    std::cout << "Placing enemy ships...\n";

    int placedShipsCount = 0;
    while (placedShipsCount != shipManager.getShipsCount())
    {
        try
        {
            int x = rand() % gameField.getWidth();
            int y = rand() % gameField.getHeight();
            Ship::Orientation orientation = rand() % 2 == 1 ? Ship::Orientation::HORIZONTAL : Ship::Orientation::VERTICAL;
            gameField.placeShip(placedShipsCount, x, y, orientation);
            placedShipsCount += 1;
        }
        catch(const std::exception& e)
        {
            // std::cerr << e.what() << '\n';
        }
    }

    std::cout << "All enemy ships have been placed.\n"; 
}