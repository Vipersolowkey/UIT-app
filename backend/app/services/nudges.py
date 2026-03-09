def generate_nudges(user_stats: dict):
    nudges = []

    if user_stats.get("last_nmlt_days", 0) > 2:
        nudges.append({
            "type": "reminder",
            "message": "Bạn chưa luyện NMLT trong 2 ngày."
        })

    if "pointer" in user_stats.get("weak_topics", []):
        nudges.append({
            "type": "weak_topic",
            "message": "Bạn thường sai câu về Pointer. Nên ôn lại."
        })

    if user_stats.get("coding_attempts", 0) < 3:
        nudges.append({
            "type": "coding",
            "message": "Bạn nên luyện thêm bài coding."
        })

    return nudges