import {spawnSync} from 'child_process'
import {RESET, CYAN, REV_RED, REV_GREEN, REV_YELLOW} from 'ansi-ec'

process.on('unhandledRejection', (reason, promise) => {
  console.log('Unhandled Rejection at:', promise)
})

export const LOG = console.log.bind(console)
export function LOG_GOOD() { LOG(`\n${REV_GREEN}GOOD:${RESET}`, ...arguments) }
export function LOG_BAD() { LOG(`\n${REV_RED}BAD:${RESET}`, ...arguments) }
export function LOG_INFO() { LOG(`${CYAN}INFO:${RESET}`, ...arguments) }

export async function EXEC(cmd, ...args) {
  const r = spawnSync(cmd, args)
  if(r.status) {
    const command = `${cmd} ${args.join(' ')}`
    const error = new Error(`command: ${command}\n${r.stderr.toString()}`)
    throw error
  }
  return r
}

export async function LOG_EXEC(...cmd) {
  LOG_INFO(`Executing command: ${cmd.join(' ')}`)
  const result = await EXEC(...cmd)
  if(result.error) {
    throw result.error
  }
  return result
}

export function PASS(info) { return {info, passed: true} }
export function FAIL(info) { return {info} }
export async function RUN(tests) {
  LOG(`\n${REV_YELLOW}RUNNING TESTS${RESET}`)
  for(let test of tests) {
    LOG(`\n${REV_YELLOW}TEST:${RESET}`)
    try {
      const result = await test()
      if(result) {
        if(result.passed) {
          LOG_GOOD(result.info)
        } else {
          LOG_BAD(result.info)
        }
      } else {
        LOG_BAD('No result')
      }
    } catch(e) {
      LOG_BAD('An exception was thrown:')
      LOG(e)
    }
  }
}
