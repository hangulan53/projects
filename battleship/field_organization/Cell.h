#ifndef CELL_H
#define CELL_H

#include <stdexcept>
#include <iostream>
#include "../json.hpp"
#include "../ship_organization/Ship.h"

class Cell
{
public:
    enum class CellStatus
    {
        UNKNOWN,
        EMPTY,
        SHIP
    };

private:
    CellStatus status;
    Ship* ship;
    int segmentIndex;
    bool showFlag;

public:
    Cell();

    CellStatus getStatus() const;
    void setStatus(CellStatus state);
    Ship* getShip() const;
    void setShip(Ship* shipPtr);
    int getSegmentIndex() const;
    void setSegmentIndex(int index);
    bool getShowFlag() const;
    void setShowFlag(bool flag);
    void printCell(bool isEnemyField) const;

    nlohmann::json toJson();
    void fromJson(nlohmann::json& j);

};

#endif