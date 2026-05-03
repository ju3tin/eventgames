export IDL = {
  "address": "2HK29Di58nED836JN14U1bPsxW4q52FLW5knoJEDmYQJ",
  "metadata": {
    "name": "motionplay",
    "version": "0.1.0",
    "spec": "0.1.0",
    "description": "Created with Anchor"
  },
  "instructions": [
    {
      "name": "claim_prize",
      "discriminator": [
        157,
        233,
        139,
        121,
        246,
        62,
        234,
        235
      ],
      "accounts": [
        {
          "name": "competition",
          "writable": true
        },
        {
          "name": "claimant",
          "writable": true,
          "signer": true
        },
        {
          "name": "vault",
          "docs": [
            "It is controlled by the program using seeds [\"vault\", competition.key]."
          ],
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  118,
                  97,
                  117,
                  108,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "competition"
              }
            ]
          }
        },
        {
          "name": "system_program",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": []
    },
    {
      "name": "create_competition",
      "discriminator": [
        110,
        212,
        234,
        212,
        118,
        128,
        158,
        244
      ],
      "accounts": [
        {
          "name": "creator",
          "writable": true,
          "signer": true
        },
        {
          "name": "competition",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  99,
                  111,
                  109,
                  112,
                  101,
                  116,
                  105,
                  116,
                  105,
                  111,
                  110
                ]
              },
              {
                "kind": "account",
                "path": "creator"
              },
              {
                "kind": "arg",
                "path": "params.game_id"
              },
              {
                "kind": "arg",
                "path": "params.random_string"
              }
            ]
          }
        },
        {
          "name": "vault",
          "docs": [
            "It is controlled by the program using seeds [\"vault\", competition.key]."
          ],
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  118,
                  97,
                  117,
                  108,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "competition"
              }
            ]
          }
        },
        {
          "name": "system_program",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "params",
          "type": {
            "defined": {
              "name": "CreateCompetitionParams"
            }
          }
        }
      ]
    },
    {
      "name": "enter",
      "discriminator": [
        139,
        49,
        209,
        114,
        88,
        91,
        77,
        134
      ],
      "accounts": [
        {
          "name": "player",
          "writable": true,
          "signer": true
        },
        {
          "name": "competition",
          "writable": true
        },
        {
          "name": "player_entry",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  101,
                  110,
                  116,
                  114,
                  121
                ]
              },
              {
                "kind": "account",
                "path": "competition"
              },
              {
                "kind": "account",
                "path": "player"
              }
            ]
          }
        },
        {
          "name": "vault",
          "docs": [
            "It is controlled by the program using seeds [\"vault\", competition.key]."
          ],
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  118,
                  97,
                  117,
                  108,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "competition"
              }
            ]
          }
        },
        {
          "name": "system_program",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": []
    },
    {
      "name": "finalize",
      "discriminator": [
        171,
        61,
        218,
        56,
        127,
        115,
        12,
        217
      ],
      "accounts": [
        {
          "name": "competition",
          "writable": true
        },
        {
          "name": "authority",
          "signer": true
        }
      ],
      "args": [
        {
          "name": "winner",
          "type": "pubkey"
        }
      ]
    }
  ],
  "accounts": [
    {
      "name": "Competition",
      "discriminator": [
        193,
        49,
        76,
        118,
        106,
        22,
        221,
        106
      ]
    },
    {
      "name": "PlayerEntry",
      "discriminator": [
        158,
        6,
        39,
        104,
        234,
        4,
        153,
        255
      ]
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "CompetitionNotActive",
      "msg": "Competition is not active"
    },
    {
      "code": 6001,
      "name": "CompetitionNotStarted",
      "msg": "Competition has not started yet"
    },
    {
      "code": 6002,
      "name": "CompetitionEnded",
      "msg": "Competition has already ended"
    },
    {
      "code": 6003,
      "name": "MaxParticipantsReached",
      "msg": "Max participants reached"
    },
    {
      "code": 6004,
      "name": "CompetitionNotEnded",
      "msg": "Competition is not finished yet"
    },
    {
      "code": 6005,
      "name": "AlreadyFinalized",
      "msg": "Competition already finalized"
    },
    {
      "code": 6006,
      "name": "NotTheWinner",
      "msg": "You are not the winner"
    }
  ],
  "types": [
    {
      "name": "Competition",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "creator",
            "type": "pubkey"
          },
          {
            "name": "username",
            "type": "string"
          },
          {
            "name": "description",
            "type": "string"
          },
          {
            "name": "game_id",
            "type": "u64"
          },
          {
            "name": "random_string",
            "type": "string"
          },
          {
            "name": "start_time",
            "type": "i64"
          },
          {
            "name": "finish_time",
            "type": "i64"
          },
          {
            "name": "entry_fee",
            "type": "u64"
          },
          {
            "name": "max_participants",
            "type": "u32"
          },
          {
            "name": "current_participants",
            "type": "u32"
          },
          {
            "name": "total_prize",
            "type": "u64"
          },
          {
            "name": "status",
            "type": {
              "defined": {
                "name": "CompetitionStatus"
              }
            }
          },
          {
            "name": "prize_rules",
            "type": {
              "defined": {
                "name": "PrizeDistribution"
              }
            }
          },
          {
            "name": "winner",
            "type": "pubkey"
          },
          {
            "name": "bump",
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "CompetitionStatus",
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "Active"
          },
          {
            "name": "Ended"
          },
          {
            "name": "Cancelled"
          }
        ]
      }
    },
    {
      "name": "CreateCompetitionParams",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "username",
            "type": "string"
          },
          {
            "name": "description",
            "type": "string"
          },
          {
            "name": "game_id",
            "type": "u64"
          },
          {
            "name": "random_string",
            "type": "string"
          },
          {
            "name": "start_time",
            "type": "i64"
          },
          {
            "name": "finish_time",
            "type": "i64"
          },
          {
            "name": "entry_fee",
            "type": "u64"
          },
          {
            "name": "max_participants",
            "type": "u32"
          }
        ]
      }
    },
    {
      "name": "PlayerEntry",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "player",
            "type": "pubkey"
          },
          {
            "name": "competition",
            "type": "pubkey"
          },
          {
            "name": "amount_paid",
            "type": "u64"
          },
          {
            "name": "bump",
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "PrizeDistribution",
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "WinnerTakesAll"
          }
        ]
      }
    }
  ]
}
