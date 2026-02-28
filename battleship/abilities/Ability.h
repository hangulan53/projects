#ifndef ABILITY_H
#define ABILITY_H

#include <string>
#include "../field_organization/GameField.h"
#include "../holders/LogHolder.h"

class Ability
{
public:
    virtual void activate(LogHolder& logHolder) = 0;
    virtual ~Ability() = default;
};

#endif