#include "DoubleDamageAbility.h"

void DoubleDamageAbility::activate(LogHolder& logHolder)
{
    logHolder.setAbility(LogHolder::Ability::DoubleActive);
}