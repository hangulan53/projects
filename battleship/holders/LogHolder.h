#ifndef LOG_HOLDER_H
#define LOG_HOLDER_H

#include "InfoHolder.h"
#include "../json.hpp"

class LogHolder: public InfoHolder
{
public:
    enum class Ability {DoubleActive, DoublePassive, Scanner, RandomFire};
    enum class AbilityResult {FOUND, EMPTY, OUTFIELD};

private:
    int x, y;
    Ability ability;
    AbilityResult abilityResult = AbilityResult::EMPTY;

public:
    std::pair<int, int> getData() override;
    void setData(int x, int y);
    Ability getAbility() const;
    void setAbility(Ability ability);
    AbilityResult getAbilityResult() const;
    void setAbilityResult(AbilityResult abilityResult);
    void printResult() const;

    nlohmann::json toJson();
    void fromJson(nlohmann::json& j);
};

#endif