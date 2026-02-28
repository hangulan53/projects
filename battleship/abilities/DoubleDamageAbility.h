#ifndef DOUBLE_DAMAGE_ABILITY_H
#define DOUBLE_DAMAGE_ABILITY_H

#include "Ability.h"

class DoubleDamageAbility: public Ability
{
public:
    void activate(LogHolder& logHolder) override;
};

#endif