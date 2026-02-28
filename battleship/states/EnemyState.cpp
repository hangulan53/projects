#include "EnemyState.h"

EnemyState::EnemyState(int width, int height, int ships_count, std::initializer_list<int> ships_sizes):
    shipManager(ships_count, ships_sizes),
    gameField(width, height)
{
    gameField.setShipManager(&shipManager);
}

void EnemyState::reset()
{
    gameField = GameField(gameField.getWidth(), gameField.getHeight()); 
    shipManager.reset();
    gameField.setShipManager(&shipManager);
}

ShipManager& EnemyState::getShipManager()
{
    return shipManager;
}

GameField& EnemyState::getGameField()
{
    return gameField;
}



nlohmann::json EnemyState::toJson()
{
    return nlohmann::json{
        {"enemyField", gameField.toJson()},
        {"enemyShipManager", shipManager.toJson()}
    };
}

void EnemyState::fromJson(nlohmann::json& j)
{
    gameField.fromJson(j["enemyField"]);
    shipManager.fromJson(j["enemyShipManager"]);
}

std::istream& operator>>(std::istream& is, EnemyState& state)
{
    nlohmann::json j;
    is >> j;
    state.fromJson(j);
    return is;
}

std::ostream& operator<<(std::ostream& os, EnemyState& state)
{
    os << state.toJson().dump(4);
    return os;
}