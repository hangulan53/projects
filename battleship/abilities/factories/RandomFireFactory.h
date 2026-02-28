#ifndef RANDOM_FIRE_FACTORY_H
#define RANDOM_FIRE_FACTORY_H

#include "AbilityFactory.h"
#include "../RandomFireAbility.h"

class RandomFireFactory: public AbilityFactory
{
private:
    GameField& field;

public:
    RandomFireFactory(GameField& field);
    Ability* createAbility() override;
    std::string getName() const override;
    nlohmann::json toJson() override;
};

#endif