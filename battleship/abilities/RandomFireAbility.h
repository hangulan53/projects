#ifndef RANDOM_FIRE_ABILITY_H
#define RANDOM_FIRE_ABILITY_H

#include "Ability.h"

class RandomFireAbility: public Ability
{
private:
    GameField& field;

public:
    RandomFireAbility(GameField& field);
    void activate(LogHolder& logHolder) override;
};

#endif