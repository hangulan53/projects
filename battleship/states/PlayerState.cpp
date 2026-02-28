#include "PlayerState.h"

PlayerState::PlayerState(int width, int height, int ships_count, std::initializer_list<int> ships_sizes, GameField& enemyField):
    shipManager(ships_count, ships_sizes),
    gameField(width, height),
    abilityManager(enemyField)
{
    gameField.setShipManager(&shipManager);
}

void PlayerState::reset()
{
    gameField = GameField(gameField.getWidth(), gameField.getHeight());
    shipManager.reset();
    gameField.setShipManager(&shipManager);
    logHolder.setAbility(LogHolder::Ability::DoublePassive);
    logHolder.setAbilityResult(LogHolder::AbilityResult::EMPTY);
}

ShipManager& PlayerState::getShipManager()
{
    return shipManager;
}

GameField& PlayerState::getGameField()
{
    return gameField;
}

AbilityManager& PlayerState::getAbilityManager()
{
    return abilityManager;
}

LogHolder& PlayerState::getLogHolder()
{
    return logHolder;
}

int PlayerState::getWinsCount()
{
    return winsCount;
}

void PlayerState::setWinsCount()
{
    winsCount += 1;
}



nlohmann::json PlayerState::toJson()
{
    return nlohmann::json{
        {"playerField", gameField.toJson()},
        {"playerShipManager", shipManager.toJson()},
        {"abilityManager", abilityManager.toJson()},
        {"logHolder", logHolder.toJson()},
        {"winsCount", winsCount}
    };
}

void PlayerState::fromJson(nlohmann::json& j)
{
    gameField.fromJson(j["playerField"]);
    shipManager.fromJson(j["playerShipManager"]);
    abilityManager.fromJson(j["abilityManager"]);
    logHolder.fromJson(j["logHolder"]);
    winsCount = j["winsCount"];
}

std::istream& operator>>(std::istream& is, PlayerState& state)
{
    nlohmann::json j;
    is >> j;
    state.fromJson(j);
    return is;
}

std::ostream& operator<<(std::ostream& os, PlayerState& state)
{
    os << state.toJson().dump(4);
    return os;
}