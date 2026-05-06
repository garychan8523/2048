class GameException(Exception):
    message = "a game error occurred"

    def __init__(self, message: str = None):
        self.message = message or self.message
        super().__init__(self.message)


class GameNotFoundException(GameException):
    message = "game not found"


class InvalidMoveException(GameException):
    message = "invalid move"
