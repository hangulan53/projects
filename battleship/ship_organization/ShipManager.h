#ifndef SHIPMANAGER_H
#define SHIPMANAGER_H

#include <vector>
#include <stdexcept>
#include "Ship.h"
#include "../json.hpp"
#include "../exceptions/ShipManagerCountException.h"
#include "../exceptions/ShipManagerIndexException.h"

class ShipManager
{
private:
    std::vector<Ship> ships_list;
    int ships_count;

public:
    ShipManager(int ships_count, std::initializer_list<int> ships_sizes);

    Ship& getShip(int index);
    std::vector<Ship> getShipsList();
    int getShipsCount() const;
    bool allShipsAreDestroyed();
    void reset();
    
    nlohmann::json toJson();
    void fromJson(nlohmann::json& j);

};

#endif