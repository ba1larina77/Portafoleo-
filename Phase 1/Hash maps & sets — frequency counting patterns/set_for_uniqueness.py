def set_unique(nums):
    counter = set()
    for num in nums:
        if num in counter:
            return False
        counter.add(num)
    return True







if __name__ == "__main__":
    nums = [1,2,3,4, 4]
    result = True
    result = set_unique(nums)
    if result == False:
        print("Your set of numbers have duplicated numbers")

    
