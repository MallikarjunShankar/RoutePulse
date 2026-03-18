from datetime import datetime, timedelta


def last_five_minute_window(reference: datetime | None = None) -> tuple[datetime, datetime]:
    end = reference or datetime.utcnow()
    start = end - timedelta(minutes=5)
    return start, end
