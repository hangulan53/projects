#include "GameField.h"

GameField::GameField(int width, int height):
    width(width),
    height(height)
{
    if (width <= 0 || height <= 0)
    {
        throw GameFieldBoundsException();
    }

    field = std::vector<std::vector<Cell>>(height, std::vector<Cell>(width));
}

GameField::GameField(const GameField& other): 
    width(other.width), 
    height(other.height), 
    field(other.field) 
{
    shipManager = other.shipManager ? new ShipManager(*other.shipManager) : nullptr;
}

GameField::GameField(GameField&& other) noexcept: 
    width(other.width),
    height(other.height), 
    field(std::move(other.field)), 
    shipManager(other.shipManager)
{
    other.shipManager = nullptr;
    other.width = 0;
    other.height = 0;
}

GameField& GameField::operator=(const GameField& other)
{
    if (this == &other)
    {
    return *this;
    }

    width = other.width;
    height = other.height;
    field = other.field;
    delete shipManager;
    shipManager = other.shipManager ? new ShipManager(*other.shipManager) : nullptr;

    return *this;
}

GameField& GameField::operator=(GameField&& other) noexcept
{
    if (this == &other)
    {
    return *this;
    }

    width = other.width;
    height = other.height;
    field = std::move(other.field);
    shipManager = other.shipManager;
    other.shipManager = nullptr;

    return *this;
}

int GameField::getWidth() const
{
    return width;
}

int GameField::getHeight() const
{
    return height;
}

Cell& GameField::getCell(int x, int y)
{
    return field[y][x];
}

void GameField::checkCoordinates(int x, int y) const
{
    if (x < 0 || x >= width || y < 0 || y >= height)
    {
        throw GameFieldCoordsException();
    }
}

void GameField::checkShipPlacement(Ship ship, int x, int y) const
{
    int dx = ship.getOrientation() == Ship::Orientation::HORIZONTAL ? ship.getLength() - 1 : 0;
    int dy = ship.getOrientation() == Ship::Orientation::HORIZONTAL ? 0 : ship.getLength() - 1;
    checkCoordinates(x, y);
    checkCoordinates(x + dx, y + dy);

    int start_x = x-1;
    int start_y = y-1;
    int end_x = x+dx+1;
    int end_y = y+dy+1;

    for (int y = start_y; y <= end_y; y++)
    {
        for (int x = start_x; x <= end_x; x++)
        {   
            if (x >= 0 && x < width && y >= 0 && y < height)
            {
                if (field[y][x].getStatus() == Cell::CellStatus::SHIP)
                {
                    throw GameFieldPlacementException();
                }
            }
        }
    }
}

void GameField::setShipManager(ShipManager* manager)
{
    shipManager = manager;
}

ShipManager* GameField::getShipManager() // Для варианта RandomFire через ShipManager.
{
    return shipManager;
}

void GameField::placeShip(int shipIndex, int x, int y, Ship::Orientation orientation)
{
    Ship& ship = shipManager->getShip(shipIndex);
    ship.setOrientation(orientation);
    checkShipPlacement(ship, x, y);

    int dx = orientation == Ship::Orientation::HORIZONTAL ? 1 : 0;
    int dy = orientation == Ship::Orientation::HORIZONTAL ? 0 : 1;

    for (int i = 0; i < ship.getLength(); i++){
        field[y][x].setStatus(Cell::CellStatus::SHIP);
        field[y][x].setShip(&ship);
        field[y][x].setSegmentIndex(i);
        y += dy;
        x += dx;
    }
}

bool GameField::attackCell(int x, int y, LogHolder& logHolder)
{
    checkCoordinates(x, y);

    if (field[y][x].getShip() != nullptr)
    {
        Ship* ship = field[y][x].getShip();
        int index = field[y][x].getSegmentIndex();

        if (ship->getSegmentStatus(index) != Ship::SegmentStatus::DESTROYED)
        {  
            if (logHolder.getAbility() == LogHolder::Ability::DoubleActive)
            {
                ship->setSegmentStatus(index, 2);
                logHolder.setAbility(LogHolder::Ability::DoublePassive);
            }
            else
            {
                ship->setSegmentStatus(index, 1);
            }

            if (ship->getIsDestroyed())
            {
                return true;
            }
        }

    }
    else
    {
        field[y][x].setStatus(Cell::CellStatus::EMPTY);
    }

    return false;
}

void GameField::attackRandomCell()
{
    int x = rand() % width;
    int y = rand() % height;

    checkCoordinates(x, y);

    if (field[y][x].getShip() != nullptr)
    {
        Ship* ship = field[y][x].getShip();
        int index = field[y][x].getSegmentIndex();

        if (ship->getSegmentStatus(index) != Ship::SegmentStatus::DESTROYED)
        {  
            ship->setSegmentStatus(index, 1);
        }

    }
    else
    {
        field[y][x].setStatus(Cell::CellStatus::EMPTY);
    }

}

void GameField::printGameField(bool isEnemyField)
{
    std::cout << "  ";
    for (int x = 0; x < width; x++)
    {
        std::cout << x << ' ';
    }
    std::cout << '\n';

    for (int y = 0; y < height; y++)
    {
        std::cout << y << ' ';

        for (int x = 0; x < width; x++)
        {
            field[y][x].printCell(isEnemyField);
        }

        std::cout << '\n';
    }

    std::cout << '\n';
}

nlohmann::json GameField::toJson()
{
    nlohmann::json jField = nlohmann::json::array();
    for (int y = 0; y < height; y++)
    {
        nlohmann::json jRow = nlohmann::json::array();
        for (int x = 0; x < width; x++)
        {
            jRow.push_back(field[y][x].toJson());
        }
        jField.push_back(jRow);
    }

    return nlohmann::json{
        {"width", width},
        {"height", height},
        {"field", jField},
        {"shipManager", shipManager->toJson()}
    };
}

void GameField::fromJson(nlohmann::json& j)
{
    width = j["width"];
    height = j["height"];
    auto jField = j["field"];
    for (int y = 0; y < height; y++)
    {
        for (int x = 0; x < width; x++)
        {
            field[y][x].fromJson(jField[y][x]);
        }
    }

    shipManager = new ShipManager(1, {1});
    shipManager->fromJson(j["shipManager"]);
}