// src/data/coding_problems.ts

export type Difficulty = "Easy" | "Medium" | "Hard";

export interface SampleCase {
  input: string;
  output: string;
  explain?: string;
}

export interface CodingProblem {
  id: string;
  title: string;
  difficulty: Difficulty;
  tags: string[];
  statement: string;
  constraints?: string[];
  samples: SampleCase[];
  starterCode: Record<string, string>; // key = language
}

export const CODING_PROBLEMS: CodingProblem[] = [
  {
    id: "two-sum",
    title: "Two Sum",
    difficulty: "Easy",
    tags: ["Array", "Hash Table"],
    statement:
      "Cho một mảng số nguyên nums và một số nguyên target. Hãy trả về chỉ số của 2 phần tử sao cho tổng của chúng bằng target.\n\nGiả sử chỉ có đúng 1 nghiệm và không được dùng lại cùng một phần tử.",
    constraints: [
      "2 <= nums.length <= 10^5",
      "-10^9 <= nums[i] <= 10^9",
      "-10^9 <= target <= 10^9",
    ],
    samples: [
      {
        input: "nums = [2,7,11,15], target = 9",
        output: "[0,1]",
        explain: "nums[0] + nums[1] = 2 + 7 = 9",
      },
      {
        input: "nums = [3,2,4], target = 6",
        output: "[1,2]",
      },
    ],
    starterCode: {
      cpp: `#include <bits/stdc++.h>
using namespace std;

vector<int> twoSum(vector<int>& nums, int target) {
    // TODO
    return {};
}

int main() {
    // Demo input (mock)
    vector<int> nums = {2,7,11,15};
    int target = 9;
    auto ans = twoSum(nums, target);
    cout << "[" << ans[0] << "," << ans[1] << "]";
    return 0;
}`,
      java: `import java.util.*;

public class Main {
    public static int[] twoSum(int[] nums, int target) {
        // TODO
        return new int[]{};
    }

    public static void main(String[] args) {
        int[] nums = new int[]{2,7,11,15};
        int target = 9;
        int[] ans = twoSum(nums, target);
        System.out.println("[" + ans[0] + "," + ans[1] + "]");
    }
}`,
      py: `def two_sum(nums, target):
    # TODO
    return []

if __name__ == "__main__":
    nums = [2,7,11,15]
    target = 9
    print(two_sum(nums, target))`,
    },
  },

  {
    id: "valid-parentheses",
    title: "Valid Parentheses",
    difficulty: "Easy",
    tags: ["Stack", "String"],
    statement:
      "Cho một chuỗi s chỉ gồm các ký tự '(', ')', '{', '}', '[' và ']'.\nHãy kiểm tra chuỗi có hợp lệ không.\n\nChuỗi hợp lệ khi: dấu đóng đúng loại với dấu mở gần nhất và theo đúng thứ tự.",
    samples: [
      { input: `s = "()"`, output: "true" },
      { input: `s = "()[]{}"`, output: "true" },
      { input: `s = "(]"`, output: "false" },
    ],
    starterCode: {
      cpp: `#include <bits/stdc++.h>
using namespace std;

bool isValid(string s) {
    // TODO
    return false;
}

int main() {
    string s = "()[]{}";
    cout << (isValid(s) ? "true" : "false");
    return 0;
}`,
      java: `import java.util.*;

public class Main {
    public static boolean isValid(String s) {
        // TODO
        return false;
    }
    public static void main(String[] args) {
        String s = "()[]{}";
        System.out.println(isValid(s) ? "true" : "false");
    }
}`,
      py: `def is_valid(s: str) -> bool:
    # TODO
    return False

if __name__ == "__main__":
    s = "()[]{}"
    print("true" if is_valid(s) else "false")`,
    },
  },

  {
    id: "longest-substring",
    title: "Longest Substring Without Repeating Characters",
    difficulty: "Medium",
    tags: ["Hash Table", "Two Pointers", "String"],
    statement:
      "Cho một chuỗi s. Hãy tìm độ dài của chuỗi con dài nhất không có ký tự lặp lại.",
    samples: [
      { input: `s = "abcabcbb"`, output: "3" },
      { input: `s = "bbbbb"`, output: "1" },
      { input: `s = "pwwkew"`, output: "3" },
    ],
    starterCode: {
      cpp: `#include <bits/stdc++.h>
using namespace std;

int lengthOfLongestSubstring(string s) {
    // TODO
    return 0;
}

int main() {
    string s = "abcabcbb";
    cout << lengthOfLongestSubstring(s);
    return 0;
}`,
      java: `import java.util.*;

public class Main {
    public static int lengthOfLongestSubstring(String s) {
        // TODO
        return 0;
    }
    public static void main(String[] args) {
        String s = "abcabcbb";
        System.out.println(lengthOfLongestSubstring(s));
    }
}`,
      py: `def length_of_longest_substring(s: str) -> int:
    # TODO
    return 0

if __name__ == "__main__":
    s = "abcabcbb"
    print(length_of_longest_substring(s))`,
    },
  },
];