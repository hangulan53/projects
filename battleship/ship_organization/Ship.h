#ifndef SHIP_H
#define SHIP_H

#include <vector>
#include <stdexcept>
#include "../json.hpp"
#include "../exceptions/ShipLengthException.h"
#include "../exceptions/ShipSegmentIndexException.h"

class Ship
{
public:
    enum class Orientation {HORIZONTAL, VERTICAL};
    enum class SegmentStatus {DESTROYED, DAMAGED, UNDAMAGED};

private:
    Orientation orientation;
    std::vector<SegmentStatus> segments;
    int length;
    bool isDestroyed;
    int shipIndex;

public:
    Ship(int length, int shipIndex);

    void checkSegmentIndex(int index) const;
    bool checkIsDestroyed() const;
    bool getIsDestroyed() const;
    void setIsDestroyed(bool flag);
    int getLength() const;
    void setLength(int length);
    Orientation getOrientation() const;
    void setOrientation(Orientation orientation);
    SegmentStatus getSegmentStatus(int index) const;
    void setSegmentStatus(int index, int damage);
    int getShipIndex();

    nlohmann::json toJson();
    void fromJson(nlohmann::json& j);
    
};

#endif