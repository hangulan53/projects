#ifndef SCANNER_FACTORY_H
#define SCANNER_FACTORY_H

#include "AbilityFactory.h"
#include "../ScannerAbility.h"
#include "../../holders/CoordHolder.h"

class ScannerFactory: public AbilityFactory
{
private:
    GameField& field;
    
public:
    ScannerFactory(GameField& field);
    Ability* createAbility() override;
    std::string getName() const override;
    nlohmann::json toJson() override;
};

#endif