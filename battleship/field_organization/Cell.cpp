#include "Cell.h"

Cell::Cell():
    status(Cell::CellStatus::UNKNOWN), 
    ship(nullptr), 
    segmentIndex(-1),
    showFlag(true)
    {}

Cell::CellStatus Cell::getStatus() const 
{ 
    return status; 
}

void Cell::setStatus(Cell::CellStatus state)
{
    status = state;
}

Ship* Cell::getShip() const 
{ 
    return ship; 
}

void Cell::setShip(Ship* shipPtr) 
{
    status = CellStatus::SHIP;
    ship = shipPtr;
}

int Cell::getSegmentIndex() const 
{ 
    return segmentIndex; 
}

void Cell::setSegmentIndex(int index) 
{
    segmentIndex = index;
}

bool Cell::getShowFlag() const
{
    return showFlag;
}

void Cell::setShowFlag(bool flag)
{
    showFlag = flag;
}

void Cell::printCell(bool isEnemyField) const
{
    switch (status)
    {
        case CellStatus::SHIP:
        {
            switch (ship->getSegmentStatus(segmentIndex))
            {
                case Ship::SegmentStatus::DESTROYED:
                {
                    std::cout << "X ";
                    break;
                }

                case Ship::SegmentStatus::DAMAGED:
                {
                    if (!showFlag)
                    {
                        std::cout << "? ";
                    }
                    else
                    {
                        std::cout << "/ "; 
                    }
                    break;
                }

                case Ship::SegmentStatus::UNDAMAGED:
                {
                    if (isEnemyField)
                    {
                        std::cout << "? "; 
                    }
                    else
                    {
                        std::cout << "S ";
                    }
                    break;
                }
            }

            break;
        }

        case CellStatus::EMPTY:
        {
            std::cout << "o ";
            break;
        }

        case CellStatus::UNKNOWN:
        {
            if (isEnemyField)
            {
                std::cout << "? "; 
            }
            else
            {
                std::cout << "~ ";
            }
            break;
        }
    }
}

nlohmann::json Cell::toJson()
{
    return nlohmann::json{
        {"status", static_cast<int>(status)},
        {"segmentIndex", segmentIndex},
        {"ship", ship == nullptr ? "empty" : ship->toJson()},
        {"showFlag", showFlag}
    };
}

void Cell::fromJson(nlohmann::json& j)
{
    status = static_cast<Cell::CellStatus>(j["status"]);
    segmentIndex = j["segmentIndex"];
    showFlag = j["showFlag"];

    if (j["ship"] != "empty")
    {
        ship = new Ship(1, -1);
        ship->fromJson(j["ship"]);
    }
    else
    {
        ship = nullptr;
    }
}