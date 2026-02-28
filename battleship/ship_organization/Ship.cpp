#include "Ship.h"

Ship::Ship(int length, int shipIndex): 
    length(length),
    orientation(Orientation::HORIZONTAL),
    segments(length, SegmentStatus::UNDAMAGED),
    isDestroyed(false),
    shipIndex(shipIndex)
{
    if (length <= 0 || length >= 5)
    {
        throw ShipLengthException();
    }
}

void Ship::checkSegmentIndex(int index) const
{
    if (index < 0 || index >= length)
    {
        throw ShipSegmentIndexException();
    }
}

bool Ship::checkIsDestroyed() const
{
    for (int i = 0; i < length; i++){
        if (segments[i] != SegmentStatus::DESTROYED)
        {
            return false;
        }
    }
    return true;
}

bool Ship::getIsDestroyed() const
{
    return isDestroyed;
}

void Ship::setIsDestroyed(bool flag)
{
    this->isDestroyed = flag;
}

int Ship::getLength() const
{
    return length;
}

void Ship::setLength(int length)
{
    this->length = length;
}


Ship::Orientation Ship::getOrientation() const
{
    return orientation;
}

void Ship::setOrientation(Orientation orientation)
{
    this->orientation = orientation;
}

Ship::SegmentStatus Ship::getSegmentStatus(int index) const
{
    checkSegmentIndex(index);
    return segments[index];
}

void Ship::setSegmentStatus(int index, int damage)
{   
    if (damage == 1)
    {
        if (getSegmentStatus(index) == SegmentStatus::UNDAMAGED)
        {
            segments[index] = SegmentStatus::DAMAGED;
        }
        else if (getSegmentStatus(index) == SegmentStatus::DAMAGED)
        {
            segments[index] = SegmentStatus::DESTROYED;
            
            if (checkIsDestroyed())
            {
                setIsDestroyed(true);
            }
        }
    }
    else if (damage == 2)
    {
        if (getSegmentStatus(index) != SegmentStatus::DESTROYED)
        {
            segments[index] = SegmentStatus::DESTROYED;
        }
    }
}

int Ship::getShipIndex()
{
    return shipIndex;
}

nlohmann::json Ship::toJson()
{
    nlohmann::json segmentsArray = nlohmann::json::array();
    for (auto& seg : segments)
    {
        segmentsArray.push_back(static_cast<int>(seg));
    }

    return nlohmann::json{
        {"length", length},
        {"orientation", orientation},
        {"isDestroyed", isDestroyed},
        {"shipIndex", shipIndex},
        {"segmentsArray", segmentsArray}
    };
}

void Ship::fromJson(nlohmann::json& j)
{
    length = j["length"];
    orientation = j["orientation"];
    isDestroyed = j["isDestroyed"];
    shipIndex = j["shipIndex"];

    segments.clear();
    auto segmentsArray = j["segmentsArray"];
    for (auto& seg : segmentsArray)
    {
        segments.push_back(static_cast<SegmentStatus>(seg));
    }
}