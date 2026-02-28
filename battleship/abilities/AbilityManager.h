#ifndef ABILITY_MANAGER_H
#define ABILITY_MANAGER_H

#include <iostream>
#include <queue>
#include <vector>
#include <algorithm>
#include <random>
#include "Ability.h"
#include "../json.hpp"
#include "factories/AbilityFactory.h"
#include "factories/DoubleDamageFactory.h"
#include "factories/RandomFireFactory.h"
#include "factories/ScannerFactory.h"
#include "../holders/CoordHolder.h"
#include "../exceptions/AbilityManagerQueueException.h"

class AbilityManager
{
private:
    std::queue<AbilityFactory*> abilityQueue;
    std::vector<AbilityFactory*> listOfAbilities;
    GameField& field;
    CoordHolder coordHolder;

public:
    AbilityManager(GameField& field);
    void addAbility();
    void useAbility(LogHolder& logHolder);
    void printAbilityQueue() const;

    nlohmann::json toJson();
    void fromJson(nlohmann::json& j);

};

#endif