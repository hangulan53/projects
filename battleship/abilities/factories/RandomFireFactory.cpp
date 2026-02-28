#include "RandomFireFactory.h"

RandomFireFactory::RandomFireFactory(GameField& field):
    field(field)
{}

Ability* RandomFireFactory::createAbility()
{
    return new RandomFireAbility(field);
}

std::string RandomFireFactory::getName() const
{
    return "Random fire";
}

nlohmann::json RandomFireFactory::toJson()
{
    return nlohmann::json{
        {"ability", "random fire"}
    };
}