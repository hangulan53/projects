#include "ScannerAbility.h"

ScannerAbility::ScannerAbility(GameField& field, int x, int y):
    field(field),
    x(x),
    y(y)
{}

void ScannerAbility::activate(LogHolder& logHolder)
{
    logHolder.setAbility(LogHolder::Ability::Scanner);
    logHolder.setData(x, y);

    bool shipDetectorFlag = false;
    int cellCount = 0;
    for (int i = y; i <= y+1; i++)
    {
        for (int j = x; j <= x+1; j++)
        {
            if (j >= 0 && j < field.getWidth() && i >= 0 && i < field.getHeight())
            {
                cellCount += 1;
                Cell& currentCell = field.getCell(j, i);
                if (currentCell.getShip() != nullptr)
                {
                    shipDetectorFlag = true;
                    break;
                }
            }
        }
    }

    if (cellCount != 0)
    {
        if (shipDetectorFlag)
        {
            logHolder.setAbilityResult(LogHolder::AbilityResult::FOUND);
        }
        else
        {
            logHolder.setAbilityResult(LogHolder::AbilityResult::EMPTY);
        }
    }
    else
    {
        logHolder.setAbilityResult(LogHolder::AbilityResult::OUTFIELD);
    }
}