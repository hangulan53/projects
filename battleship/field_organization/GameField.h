#ifndef GAMEFIELD_H
#define GAMEFIELD_H

#include <stdexcept>
#include <iostream>
#include <vector>
#include "Cell.h"
#include "../json.hpp"
#include "../ship_organization/ShipManager.h"
#include "../exceptions/GameFieldBoundsException.h"
#include "../exceptions/GameFieldCoordsException.h"
#include "../exceptions/GameFieldPlacementException.h"
#include "../holders/LogHolder.h"

class GameField
{
private:
    int width;
    int height;
    std::vector<std::vector<Cell>> field;
    ShipManager* shipManager = nullptr;

public:
    GameField(int width, int height);
    GameField(const GameField& other);
    GameField(GameField&& other) noexcept;

    GameField& operator=(const GameField& other);
    GameField& operator=(GameField&& other) noexcept;

    int getWidth() const;
    int getHeight() const;
    Cell& getCell(int x, int y);
    void checkCoordinates(int x, int y) const;
    void checkShipPlacement(Ship ship, int x, int y) const;
    void setShipManager(ShipManager* manager);
    ShipManager* getShipManager(); // Для варианта RandomFire через ShipManager.
    void placeShip(int shipIndex, int x, int y, Ship::Orientation orientation);
    bool attackCell(int x, int y, LogHolder& logHolder);
    void attackRandomCell();
    void printGameField(bool isEnemyField);

    nlohmann::json toJson();
    void fromJson(nlohmann::json& j);
};

#endif