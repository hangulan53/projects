#ifndef SHIP_PLACER_H
#define SHIP_PLACER_H

#include <stdio.h>
#include "../field_organization/GameField.h"
#include "../ship_organization/ShipManager.h"
#include "../holders/CoordHolder.h"
#include "../holders/OrientationReader.h"

class ShipPlacer
{
public:
    static void placePlayerShips(GameField& gameField, ShipManager& shipManager);
    static void placeEnemyShips(GameField& gameField, ShipManager& shipManager);
};

#endif