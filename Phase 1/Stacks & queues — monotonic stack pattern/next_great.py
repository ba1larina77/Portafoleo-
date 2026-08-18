def next_greater(nums): 
    stack = [] 
    result = [-1] * len(nums) 
    for i, num in enumerate(nums): 
        while stack and nums[stack[-1]] < num:
             idx = stack.pop() 
             result[idx] = num 
             stack.append(i) 
        return result


if __name__ == "__main__":
    nums = [2,1,5,3,4]  
    result = next_greater(nums)  
    print(result)
