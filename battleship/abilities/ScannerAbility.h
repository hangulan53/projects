#ifndef SCANNER_ABILITY_H
#define SCANNER_ABILITY_H

#include "Ability.h"

class ScannerAbility: public Ability
{
private:
    GameField& field;
    int x, y;

public:
    ScannerAbility(GameField& field, int x, int y);
    void activate(LogHolder& logHolder) override;
};

#endif