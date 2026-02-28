#ifndef ENEMY_STATE_H
#define ENEMY_STATE_H

#include <iostream>
#include <vector>
#include "GameState.h"

class EnemyState: public GameState
{
private:
    GameField gameField;
    ShipManager shipManager;

public:
    EnemyState(int width, int height, int ships_count, std::initializer_list<int> ships_sizes);
    void reset() override;
    ShipManager& getShipManager() override;
    GameField& getGameField() override;
    nlohmann::json toJson() override;
    void fromJson(nlohmann::json& j) override;

    friend std::istream& operator>> (std::istream& is, EnemyState& state);
    friend std::ostream& operator<< (std::ostream& os, EnemyState& state);
    
};

#endif