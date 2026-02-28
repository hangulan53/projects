#include "ScannerFactory.h"

ScannerFactory::ScannerFactory(GameField& field):
    field(field)
{}

Ability* ScannerFactory::createAbility()
{
    CoordHolder coordHolder;
    coordHolder.setData();
    std::pair<int, int> coords = coordHolder.getData();

    return new ScannerAbility(field, coords.first, coords.second);
}

std::string ScannerFactory::getName() const
{
    return "Scanner";
}

nlohmann::json ScannerFactory::toJson()
{
    return nlohmann::json{
        {"ability", "scanner"}
    };
}