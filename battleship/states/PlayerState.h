#ifndef PLAYER_STATE_H
#define PLAYER_STATE_H

#include <iostream>
#include <vector>
#include "GameState.h"
#include "../abilities/AbilityManager.h"
#include "../holders/LogHolder.h"

class PlayerState: public GameState
{
private:
    GameField gameField;
    ShipManager shipManager;
    AbilityManager abilityManager;
    LogHolder logHolder;
    int winsCount = 0;

public:
    PlayerState(int width, int height, int ships_count, std::initializer_list<int> ships_sizes, GameField& enemyField);
    void reset() override;
    ShipManager& getShipManager() override;
    GameField& getGameField() override;
    nlohmann::json toJson() override;
    void fromJson(nlohmann::json& j) override;
    AbilityManager& getAbilityManager();
    LogHolder& getLogHolder();
    int getWinsCount();
    void setWinsCount();

    friend std::istream& operator>> (std::istream& is, PlayerState& state);
    friend std::ostream& operator<< (std::ostream& os, PlayerState& state);

};

#endif