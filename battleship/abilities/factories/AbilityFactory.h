#ifndef ABILITY_FACTORY_H
#define ABILITY_FACTORY_H

#include "../Ability.h"
#include "../../json.hpp"

class AbilityFactory
{
public:
    virtual Ability* createAbility() = 0;
    virtual std::string getName() const = 0;
    virtual nlohmann::json toJson() = 0;
    virtual ~AbilityFactory() = default;
};

#endif