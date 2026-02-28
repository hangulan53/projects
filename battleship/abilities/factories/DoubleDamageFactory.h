#ifndef DOUBLE_DAMAGE_FACTORY_H
#define DOUBLE_DAMAGE_FACTORY_H

#include "AbilityFactory.h"
#include "../DoubleDamageAbility.h"

class DoubleDamageFactory: public AbilityFactory
{
public:
    Ability* createAbility() override;
    std::string getName() const override;
    nlohmann::json toJson() override;
};

#endif