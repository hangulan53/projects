#ifndef GAME_STATE_H
#define GAME_STATE_H

#include <iostream>
#include <fstream>
#include "../json.hpp"
#include "../field_organization/GameField.h"
#include "../ship_organization/ShipManager.h"

class GameState
{
public:
    virtual void reset() = 0; 
    virtual ShipManager& getShipManager() = 0;
    virtual GameField& getGameField() = 0;
    virtual nlohmann::json toJson() = 0;
    virtual void fromJson(nlohmann::json& j) = 0;
    ~GameState() = default;
    
};

#endif