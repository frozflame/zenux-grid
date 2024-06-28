type NumOrNull = number | null;

export function getVisiblePageNums(pageNum: number, pageNumTotal: number): NumOrNull[] {
    const nums: NumOrNull[] = [1];
    for (let num = 2; num < pageNumTotal; num++) {
        if (Math.abs(pageNum - num) < 3) {
            nums.push(num);
        } else if (nums[nums.length - 1]) {
            nums.push(null);
        }
    }
    if (pageNumTotal > 1) {
        nums.push(pageNumTotal);
    }
    return nums;
}