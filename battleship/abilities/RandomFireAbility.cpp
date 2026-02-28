#include "RandomFireAbility.h"

RandomFireAbility::RandomFireAbility(GameField& field):
    field(field)
{}

void RandomFireAbility::activate(LogHolder& logHolder) // Вариант через ShipManager.
{   
    logHolder.setAbility(LogHolder::Ability::RandomFire);

    ShipManager* shipManager = field.getShipManager();
    int shipsCount = shipManager->getShipsCount();

    Ship& ship = shipManager->getShip(rand() % shipsCount);
    int shipLength = ship.getLength();
    int segmentIndex = rand() % shipLength;
    while (ship.getSegmentStatus(segmentIndex) == Ship::SegmentStatus::DESTROYED)
    {
        ship = shipManager->getShip(rand() % shipsCount);
        shipLength = ship.getLength();
        segmentIndex = rand() % shipLength;
    }

    ship.setSegmentStatus(segmentIndex, 1);

    for (int y = 0; y < field.getHeight(); y++)
    {
        for (int x = 0; x < field.getWidth(); x++)
        {
            Cell& currentCell = field.getCell(x, y);
            if (currentCell.getShip() == &ship && currentCell.getSegmentIndex() == segmentIndex)
            {
                currentCell.setShowFlag(false);
                break;
            }
        }
    }
}

/*void RandomFireAbility::activate(LogHolder& logHolder) // Вариант через GameField.
{   
    logHolder.setAbility(LogHolder::Ability::RandomFire);
    std::vector<std::pair<int, int>> validShipSegments;
    for (int y = 0; y < field.getHeight(); y++)
    {
        for (int x = 0; x < field.getWidth(); x++)
        {
            Cell& currentCell = field.getCell(x, y);
            if (currentCell.getShip() != nullptr)
            {
                Ship* ship = currentCell.getShip();
                int index = currentCell.getSegmentIndex();

                if (ship->getSegmentStatus(index) != Ship::SegmentStatus::DESTROYED)
                {
                    validShipSegments.push_back({x, y});
                }
            }
        }
    }

    std::pair<int, int> validCoords = validShipSegments[rand() % validShipSegments.size()];
    field.attackCell(validCoords.first, validCoords.second);
    Cell& validCell = field.getCell(validCoords.first, validCoords.second);
    // std::cout << validCoords.first << ", " << validCoords.second << "\n";
    validCell.setShowFlag(false);
}*/