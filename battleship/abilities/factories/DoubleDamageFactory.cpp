#include "DoubleDamageFactory.h"

Ability* DoubleDamageFactory::createAbility()
{
    return new DoubleDamageAbility();
}

std::string DoubleDamageFactory::getName() const
{
    return "Double damage";
}

nlohmann::json DoubleDamageFactory::toJson()
{
    return nlohmann::json{
        {"ability", "double damage"}
    };
}