#include "ShipManager.h"

ShipManager::ShipManager(int ships_count, std::initializer_list<int> ships_sizes): 
    ships_count(ships_count)
{
    if (ships_count != ships_sizes.size())
    {
        throw ShipManagerCountException();
    }

    int ind = 0;
    for (int size : ships_sizes)
    {
        ships_list.emplace_back(Ship(size, ind));
        ind += 1;
    }

}

Ship& ShipManager::getShip(int index)
{
    if (index < 0 || index >= ships_count)
    {
        throw ShipManagerIndexException();
    }

    return ships_list[index];
}

std::vector<Ship> ShipManager::getShipsList()
{
    return ships_list;
}

int ShipManager::getShipsCount() const
{
    return ships_count;
}

bool ShipManager::allShipsAreDestroyed()
{
    for (int i = 0; i < ships_count; i++)
    {
        if (!ships_list[i].getIsDestroyed())
        {
            return false;
        }
    }

    return true;
}

void ShipManager::reset()
{
    ships_list.clear();
    for (int i = 0; i < ships_count; i++)
    {
        ships_list.emplace_back(Ship(ships_list[i].getLength(), i));
    }
}

nlohmann::json ShipManager::toJson()
{
    nlohmann::json shipsArray = nlohmann::json::array();
    for (auto& ship : ships_list)
    {
        shipsArray.push_back(ship.toJson());
    }

    return nlohmann::json{
        {"ships_list", shipsArray},
        {"ships_count", ships_count}
    };
}


void ShipManager::fromJson(nlohmann::json& j)
{
    ships_count = j["ships_count"];

    ships_list.clear();
    auto shipsArray = j["ships_list"];
    for (auto& ship : shipsArray)
    {
        Ship curr(1, -1);
        curr.fromJson(ship);
        ships_list.push_back(curr);
    }
}