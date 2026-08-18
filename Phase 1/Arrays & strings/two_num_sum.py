def two_numbers(nums, target):
    left = 0
    right = len(nums) - 1

    while left < right:
        current = nums[left] + nums[right]
        if current == target:
            print(f"Estos dos números suman el target {target}: left={nums[left]}, right={nums[right]}")
            return [left, right]
        if current < target:
            left += 1
        else:
            right -= 1

    print(f"No hay dos números que sumen el target {target}")
    return None


if __name__ == "__main__":
    nums = [1, 3, 4, 5, 7, 9, 11]
    target = 9
    result = two_numbers(nums, target)
    print("Resultado:", result)

