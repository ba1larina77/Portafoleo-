

def max_window(nums, k):
    count = 0
    for i in range(len(nums) - (k - 1 )):
        if count < sum(nums[i:i+k]):
            count = sum(nums[i:i+k])
    return count

 
if __name__ == "__main__":
    nums = [1, 3, 4, 5, 7, 9, 11]
    k = 3
    result = max_window(nums, k)
    print(f"The maximum sum of a subarray of size {k} is: {result}")


